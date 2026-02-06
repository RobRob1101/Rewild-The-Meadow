from flask import Flask, render_template, request

app = Flask(__name__)

# Config
app.config['TEMPLATES_AUTO_RELOAD'] = True


# Deine Liste der 10 Arten
erwueschte_arten = [
    "Wiesen-Flockenblume", "Margerite", "Scharfer Hahnenfuß", 
    "Rotklee", "Wiesen-Glockenblume", "Wiesen-Bocksbart", 
    "Wiesen-Salbei", "Zaun-Wicke", "Wiesen-Knautie", "Klappertopf"
]

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        selected = request.form.getlist('vorhandene_arten')
        # Hier können die anderen Daten (Feuchte, etc.) wie gehabt verarbeitet werden
        
        graeser_antwort = request.form.get('Graeser_gt_35')
        krauter_antwort = request.form.get('Krauter_gt_40')

        return f""" 
        
        Daten empfangen. Ausgewählte Arten: {', '.join(selected)}   -------------
        unerwünschte Gräser > 35%: {graeser_antwort}  ----------
        unerwünschte Kräuter > 40%: {krauter_antwort}  ----------

        """
    

    return render_template('index.html', flowers=erwueschte_arten)



if __name__ == '__main__':
    app.run(debug=True)

