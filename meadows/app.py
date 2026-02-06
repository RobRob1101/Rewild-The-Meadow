from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def home():
    upper_text = ""
    if request.method == 'POST':
        # Retrieve data from the input field named 'user_input'
        original_text = request.form.get('user_input', '')
        upper_text = original_text.upper()
        
    return render_template('index.html', result=upper_text)


if __name__ == '__main__':
    app.run(debug=True)