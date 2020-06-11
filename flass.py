from flask import Flask
from flask import send_file
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.keys import Keys
from IPython.core.display import display, HTML
from time import sleep

options = Options()
#options.headless = True


driver = webdriver.Firefox(options=options) #

app = Flask(__name__)

@app.route("/")
def hello():
    try:
        #return render_template('./screenshot.png')
        driver.get("http://web.whatsapp.com")
        sleep(1)
        driver.save_screenshot("screenshot.png")
        return send_file('screenshot.png')
    except Exception as e:
        return str(e)
    #return "Hello World!"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)