import logging
import platform
import subprocess
from pathlib import Path


class ContainmentHandler:
    """Handles OS-level containment like locking folders to read-only using ACLs."""

    def __init__(self, logger: logging.Logger = None):
        self.log = logger or logging.getLogger("ransom_trap.agent.containment")

    def lock_folder(self, target_path: str) -> bool:
        """
        Attempts to lock down the folder containing the target file by setting it to Read-Only.
        On Windows, this uses icacls to deny write access to Everyone.
        On Linux/Mac, it uses chmod to strip write bits.
        """
        path = Path(target_path)
        # We lock the parent directory of the compromised file to protect siblings
        folder = path.parent if path.is_file() else path

        if not folder.exists():
            self.log.error("Containment failed: Folder %s does not exist", folder)
            return False

        try:
            if platform.system() == "Windows":
                # 'icacls' syntax to deny write access (W) to Everyone (WD = Write Data, AD = Append Data)
                # We deny Write Data, Append Data, Write Attributes, Write Extended Attributes
                cmd = ["icacls", str(folder), "/deny", "Everyone:(W,WD,AD,WA,WEA)"]
                self.log.warning("Applying Windows ACL lock to %s", folder)
                result = subprocess.run(
                    cmd, 
                    capture_output=True, 
                    text=True, 
                    check=False
                )
                if result.returncode != 0:
                    self.log.error("icacls failed: %s", result.stderr.strip())
                    return False
                return True
            else:
                # POSIX fallback: strip write permissions recursively
                self.log.warning("Applying POSIX chmod lock to %s", folder)
                cmd = ["chmod", "-R", "a-w", str(folder)]
                result = subprocess.run(
                    cmd, 
                    capture_output=True, 
                    text=True, 
                    check=False
                )
                if result.returncode != 0:
                    self.log.error("chmod failed: %s", result.stderr.strip())
                    return False
                return True
                
        except Exception as e:
            self.log.error("Failed to apply OS containment lock to %s: %s", folder, e)
            return False

    def unlock_folder(self, target_path: str) -> bool:
        """Reverts the folder lock (strictly for testing/recovery)."""
        folder = Path(target_path).parent if Path(target_path).is_file() else Path(target_path)
        
        try:
            if platform.system() == "Windows":
                cmd = ["icacls", str(folder), "/remove:d", "Everyone"]
                subprocess.run(cmd, capture_output=True, check=False)
            else:
                cmd = ["chmod", "-R", "a+w", str(folder)]
                subprocess.run(cmd, capture_output=True, check=False)
            return True
        except Exception:
            return False
