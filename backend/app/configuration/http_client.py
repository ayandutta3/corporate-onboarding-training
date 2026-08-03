import httpx

def get_http_client() -> httpx.Client:
    return httpx.Client(verify=False)

def get_async_http_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(verify=False)
