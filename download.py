import urllib.request
import ssl
import sys
import os

url = "https://github.com/skywind3000/ECDICT/releases/download/1.0.28/stardict.csv.zip"
proxies = [
    "https://ghproxy.net/",
    "https://mirror.ghproxy.com/",
    "https://ghp.ci/",
    "https://gh.api.99988866.xyz/",
    "https://kkgithub.com/",
    "https://github.moeyy.xyz/",
    "https://raw.githubusercontent.com/",
    "https://mirror.ghproxy.com/https://github.com/",
    "https://download.nuaa.cf/"
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

for p in proxies:
    if "kkgithub" in p:
        target = url.replace("github.com", "kkgithub.com")
    elif "download.nuaa.cf" in p:
        target = url.replace("github.com", "download.nuaa.cf")
    elif "mirror.ghproxy.com/https://github.com/" in p:
        target = url.replace("https://github.com/", p)
    else:
        target = p + url
        
    print(f"Trying {target}...")
    try:
        req = urllib.request.Request(target, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=15) as response:
            if response.status == 200:
                print("Connected! Downloading...")
                total_size = int(response.getheader('Content-Length', 0))
                downloaded = 0
                with open("data/raw/ECDICT/stardict.csv.zip", "wb") as f:
                    while True:
                        chunk = response.read(65536)
                        if not chunk:
                            break
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            percent = (downloaded / total_size) * 100
                            print(f"\rProgress: {percent:.1f}% ({downloaded}/{total_size})", end="")
                print("\nDownload complete!")
                sys.exit(0)
    except Exception as e:
        print(f"Failed: {e}")

print("All proxies failed.")
sys.exit(1)
