import os
import requests
import base64
from flask import Flask, render_template, request, jsonify, session

app = Flask(__name__)

# Session configuration
app.secret_key = "hairlytics_secret_key"

# Roboflow Model Parameters
API_KEY = "QjgyAU25Xom2Ftf8HLmz"
MODEL_ID = "hair-lytics-dataset-hjiao/1"

# ==========================================
# CORE NAVIGATION ROUTES
# ==========================================

@app.route('/')
def home():
    return render_template("index.html")

@app.route('/analyze')
def analyze():
    # Dynamic fallback check pattern for routing strings
    page = request.args.get('page')
    if page:
        if page == 'about': return render_template("about.html")
        if page == 'features': return render_template("features.html")  # FIXED HERE
        if page == 'instructions': return render_template("instructions.html")
        if page == 'contact': return render_template("contact.html")
        if page == 'shop': return render_template("shop.html")
        if page == 'review': return render_template("review.html")
        
    return render_template("analyze.html")

@app.route('/loading')
def loading():
    return render_template("loading.html")

@app.route('/result')
def result():
    analysis = session.get('analysis', 'Normal Scalp')
    recommendation = session.get('recommendation', 'Maintain your routine with a balanced moisturizing shampoo.')
    
    return render_template(
        "result.html",
        analysis=analysis,
        recommendation=recommendation
    )

@app.route('/about')
def about():
    return render_template("about.html")

@app.route('/contact')
def contact():
    return render_template("contact.html")

@app.route('/shop')
def shop():
    return render_template("shop.html")

@app.route('/notify')
def notify():
    return render_template("notify.html")

@app.route('/features')
def features():
    return render_template("features.html")  # FIXED HERE

@app.route('/review')
def review():
    return render_template("review.html")

# ==========================================
# ASYNCHRONOUS FORM / TRANSACTION ENDPOINTS
# ==========================================

@app.route('/feedback', methods=['GET', 'POST'])
def feedback():
    """ Handles rendering user review template page on GET requests 
        and processing incoming async fetch request payloads on POST requests. """
    if request.method == 'POST':
        data = request.get_json() or {}
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        if not rating:
            return jsonify({"status": "error", "message": "Rating configuration missing"}), 400
            
        print(f"[LOG] Review Received -> Score: {rating}/5 Stars | Text: {comment}")
        return jsonify({"status": "success", "message": "Feedback parsed successfully"}), 200

    return render_template("review.html")

@app.route('/set-reminder', methods=['POST'])
def set_reminder():
    """ Catches care notification system intervals dynamically configured inside the user modals. """
    data = request.get_json() or {}
    
    treatments = data.get('treatments', [])
    interval_days = data.get('interval_days')
    email = data.get('email')
    
    if not treatments or not interval_days or not email:
        return jsonify({"status": "error", "message": "Missing care profile configuration setups."}), 400
        
    print(f"[LOG] Active Reminder Configured -> Recipient: {email} | Tasks: {treatments} | Target Recurrence: Every {interval_days} Day(s)")
    
    return jsonify({"status": "success", "message": "Care configurations updated successfully."}), 200

# ==========================================
# INTERACTIVE MACHINE LEARNING PREDICTION PRESET
# ==========================================

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No image file uploaded'
            })

        file = request.files['image']
        image_bytes = file.read()

        # Convert image structure safely to base64 encoding strings
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # Roboflow API configuration target URL
        upload_url = f"https://detect.roboflow.com/{MODEL_ID}?api_key={API_KEY}"

        response = requests.post(
            upload_url,
            data=image_base64,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

        result_data = response.json()
        predictions = result_data.get('predictions', [])

        # Fallback presets
        detected_scalp = "Normal Scalp"
        recommendation = "Maintain your routine with a balanced moisturizing shampoo."

        # Analytical diagnostic engine mapping
        if predictions:
            top_prediction = predictions[0]
            class_name = top_prediction.get('class', 'Healthy').lower()

            if "dandruff" in class_name:
                detected_scalp = "Dandruff Scalp"
                recommendation = "Use Salicylic Acid or Zinc Pyrithione shampoo twice weekly."
            elif "oily" in class_name:
                detected_scalp = "Oily Scalp"
                recommendation = "Use clarifying shampoo to control excess oil."
            elif "dry" in class_name:
                detected_scalp = "Dry Scalp"
                recommendation = "Use sulfate-free moisturizing cleansers."
            elif "fall" in class_name or "thinning" in class_name:
                detected_scalp = "Hair Thinning / Fall Detected"
                recommendation = "Use anti-hairfall serum and consult a specialist."

        # Save data trends cleanly to server-side user cookie sessions
        session['analysis'] = detected_scalp
        session['recommendation'] = recommendation

        return jsonify({
            'status': 'success',
            'analysis': detected_scalp,
            'recommendation': recommendation
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f"Server Error Encountered: {str(e)}"
        })

if __name__ == '__main__':
    app.run(debug=True)