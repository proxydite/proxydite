import requests
from PIL import Image
import pywhatkit as kt

def fetch_apod_url(api_key):
    url = f'https://api.nasa.gov/planetary/apod?api_key={api_key}'
    response = requests.get(url)
    data = response.json()
    return data['url']

def convert_image_to_ascii(image_url):
    image_path = 'apod_image.jpg'
    response = requests.get(image_url, stream=True)
    if response.status_code == 200:
        with open(image_path, 'wb') as f:
            for chunk in response:
                f.write(chunk)
        ascii_path = 'ascii_art.txt'
        kt.image_to_ascii_art(image_path, ascii_path)
        return ascii_path
    return None

if __name__ == "__main__":
    import os
    api_key = os.getenv('NASA_API_KEY')
    image_url = fetch_apod_url(api_key)
    ascii_art_path = convert_image_to_ascii(image_url)
    print
