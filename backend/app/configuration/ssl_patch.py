import ssl
import os
import urllib3
import requests
import httpx

def apply_ssl_bypass():
    """
    Globally bypass SSL certificate verification across:
    1. Standard Python ssl module (default context)
    2. Environment variables (CURL_CA_BUNDLE, REQUESTS_CA_BUNDLE, PYTHONHTTPSVERIFY)
    3. urllib3 (suppress warnings)
    4. requests library (forces verify=False on Session.send, fixing Langfuse OTLP span exporter)
    5. httpx library (defaults verify=False on Client and AsyncClient)
    """
    # 1. Standard SSL context
    ssl._create_default_https_context = ssl._create_unverified_context

    # 2. Environment variables
    os.environ["PYTHONHTTPSVERIFY"] = "0"
    os.environ["CURL_CA_BUNDLE"] = ""
    os.environ["REQUESTS_CA_BUNDLE"] = ""

    # 3. urllib3 warnings
    try:
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
        urllib3.disable_warnings()
    except Exception:
        pass

    # 4. Patch requests.Session.send to force verify=False
    try:
        if not getattr(requests.Session.send, "_is_patched", False):
            orig_send = requests.Session.send
            def patched_send(self, request, **kwargs):
                kwargs['verify'] = False
                return orig_send(self, request, **kwargs)
            patched_send._is_patched = True
            requests.Session.send = patched_send
    except Exception as e:
        print(f"Warning patching requests: {e}")

    # 5. Patch httpx Client & AsyncClient to default verify=False
    try:
        if not getattr(httpx.Client.__init__, "_is_patched", False):
            orig_httpx_init = httpx.Client.__init__
            def patched_httpx_init(self, *args, **kwargs):
                if 'verify' not in kwargs:
                    kwargs['verify'] = False
                orig_httpx_init(self, *args, **kwargs)
            patched_httpx_init._is_patched = True
            httpx.Client.__init__ = patched_httpx_init

        if not getattr(httpx.AsyncClient.__init__, "_is_patched", False):
            orig_httpx_async_init = httpx.AsyncClient.__init__
            def patched_httpx_async_init(self, *args, **kwargs):
                if 'verify' not in kwargs:
                    kwargs['verify'] = False
                orig_httpx_async_init(self, *args, **kwargs)
            patched_httpx_async_init._is_patched = True
            httpx.AsyncClient.__init__ = patched_httpx_async_init
    except Exception as e:
        print(f"Warning patching httpx: {e}")

# Run SSL bypass patch immediately upon import
apply_ssl_bypass()
