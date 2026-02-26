import requests
import os
import json

# Create a dummy text file
with open("test_clean.txt", "w") as f:
    f.write("This is a clean text file with low entropy. " * 100)

# Create a highly entropic (random) fake encrypted file
with open("test_encrypted.bin", "wb") as f:
    f.write(os.urandom(1024 * 50)) # 50 KB of random bytes

url = "http://localhost:8000/scan"

# Upload both
with open("test_clean.txt", "rb") as f1, open("test_encrypted.bin", "rb") as f2:
    files = [
        ('files', ('test_clean.txt', f1, 'text/plain')),
        ('files', ('test_encrypted.bin', f2, 'application/octet-stream'))
    ]
    resp = requests.post(url, files=files)

print(f"Status: {resp.status_code}")
try:
    print(json.dumps(resp.json(), indent=2))
except Exception as e:
    print(resp.text)

# Cleanup
os.remove("test_clean.txt")
os.remove("test_encrypted.bin")
