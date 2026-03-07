import os
import random
import sys
import time

def simulate_encryption(target_dir):
    """
    Rapidly overwrites files in a directory with high-entropy random byte strings
    to trigger the Ransom-Trap detector.
    WARNING: THIS DESTROYS FILE CONTENTS. ONLY RUN ON TEST FILES.
    """
    print(f"[*] Starting Ransomware Simulation in: {target_dir}")
    print("[!] WARNING: All files in this directory will be overwritten with garbage data.")
    
    # Generate non-honeytoken dummy files to ensure the entropy threshold is hit
    # and a ransomware_suspected alert is generated instead of just honeytoken alerts.
    for i in range(5):
        dummy_path = os.path.join(target_dir, f"standard_dummy_doc_{i}.txt")
        if not os.path.exists(dummy_path):
            with open(dummy_path, "w") as f:
                f.write("This is a standard document for testing entropy detection.\n" * 100)

    files_to_encrypt = []
    for root, _, files in os.walk(target_dir):
        for file in files:
            # Skip python scripts to avoid destroying itself or the agent
            if not file.endswith('.py'):
                files_to_encrypt.append(os.path.join(root, file))

    if not files_to_encrypt:
        print("[-] No test files found. Please add some dummy .txt or .docx files first.")
        return

    random.shuffle(files_to_encrypt)

    print(f"[*] Found {len(files_to_encrypt)} target files. Encrypting...")

    # We want to encrypt at least 3-5 files within a few seconds to trigger the threshold
    for i, file_path in enumerate(files_to_encrypt):
        if file_path.endswith('.bak'):
            continue
            
        try:
            # Backup original file if not backed up yet
            bak_path = file_path + '.bak'
            if not os.path.exists(bak_path):
                import shutil
                shutil.copy2(file_path, bak_path)

            # Generate 5MB of pure high-entropy randomness
            garbage_data = os.urandom(5 * 1024 * 1024) 
            
            with open(file_path, 'wb') as f:
                f.write(garbage_data)
                f.flush()
                # Hold the file handle open so the agent's OS-level process tracker 
                # can catch the PID and terminate this script to stop the attack!
                time.sleep(1.5)
                
            print(f"[+] Encrypted: {file_path}")
            
        except PermissionError:
            print(f"[-] Permission Denied (Ransom-Trap may have locked the folder!): {file_path}")
            break
        except Exception as e:
            print(f"[-] Failed to encrypt {file_path}: {e}")


def restore_files(target_dir):
    """
    Restores the garbage files back to their original state using .bak files.
    Also cleans up any dummy documents created for threshold testing.
    """
    print(f"[*] Restoring files in {target_dir} to clean state...")
    restored_count = 0
    import shutil
    for root, _, files in os.walk(target_dir):
        for file in files:
            if file.endswith('.bak'):
                bak_path = os.path.join(root, file)
                orig_path = bak_path[:-4] # remove .bak
                try:
                    # Give it write permissions in case the agent locked it
                    os.chmod(root, 0o777)
                    if os.path.exists(orig_path):
                        os.chmod(orig_path, 0o666)
                        
                    if 'standard_dummy_doc_' in orig_path:
                        # Dummy file used just for threshold testing - delete it entirely
                        if os.path.exists(orig_path):
                            os.remove(orig_path)
                    else:
                        # Legitimate test file - restore its contents
                        shutil.copy2(bak_path, orig_path)
                        
                    os.remove(bak_path)
                    restored_count += 1
                except Exception as e:
                    print(f"[-] Could not restore {orig_path}: {e}")
                    
        # Sweep for any unencrypted dummy files that were missed
        for file in files:
            if file.startswith('standard_dummy_doc_'):
                dummy_path = os.path.join(root, file)
                try:
                    os.chmod(root, 0o777)
                    if os.path.exists(dummy_path):
                        os.chmod(dummy_path, 0o666)
                        os.remove(dummy_path)
                except:
                    pass
                    
    print(f"[+] Cleaned/Restored {restored_count} files.")


if __name__ == "__main__":
    # Use the test_files directory by default
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    
    if len(sys.argv) > 1 and sys.argv[1] == "--undo":
        # Accept optional target_dir: python simulate_ransomware.py --undo [target_dir]
        target = sys.argv[2] if len(sys.argv) > 2 else SCRIPT_DIR
        restore_files(target)
    else:
        # Accept optional target_dir: python simulate_ransomware.py [target_dir]
        target = sys.argv[1] if len(sys.argv) > 1 else SCRIPT_DIR
        simulate_encryption(target)
