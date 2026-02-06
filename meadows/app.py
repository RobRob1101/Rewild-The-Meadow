from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def wiesen_check():
    bewertung = None
    massnahmen = []

    if request.method == 'POST':
        # Daten aus dem Formular abrufen
        arten = request.form.get('arten')
        wuechsigkeit = request.form.get('wuechsigkeit')
        exposition = request.form.get('exposition')
        feuchte = request.form.get('feuchte')
        wald_einfluss = request.form.get('wald_einfluss')
        samen_nachbarn = request.form.get('samen_nachbarn')
        unbeiwert = int(request.form.get('unbeiwert', 0))
        potenzial = request.form.get('potenzial')

        # Einfache Logik für Maßnahmenvorschläge
        if unbeiwert > 20:
            massnahmen.append("Regulierung der unerwünschten Arten durch gezielten Schnitt oder Ausstechen.")
        
        if feuchte == "sehr trocken":
            massnahmen.append("Schonende Nutzung, um die Grasnarbe nicht zu verletzen (Gefahr von Lücken).")
        
        if wuechsigkeit == "gering":
            massnahmen.append("Nährstoffmanagement prüfen: Evtl. moderate Düngung zur Stärkung des Bestandes.")

        if not massnahmen:
            massnahmen.append("Der Bestand wirkt stabil. Aktuelle Bewirtschaftung beibehalten.")

        bewertung = {
            "arten": arten,
            "potenzial": potenzial,
            "massnahmen": massnahmen
        }

    return render_template('index.html', result=bewertung)

if __name__ == '__main__':
    app.run(debug=True)