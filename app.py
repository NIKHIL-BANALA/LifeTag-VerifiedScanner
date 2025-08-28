from flask import Flask, render_template, request, jsonify
from itsdangerous import URLSafeSerializer
import os
# Initialize the Flask application
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/decrypt', methods=['POST'])
def decrypt_private():
    try:
        encrypted_private = request.json.get("encrypted_private", "")
        if not encrypted_private:
            return jsonify({"error": "No encrypted data provided"}), 400
        
        s = URLSafeSerializer(os.environ.get('SECRET_KEY'))
        private_data = s.loads(encrypted_private)
        return jsonify({"private": private_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        ssl_context='adhoc'
    )
