# backend/app.py (Updated for JS Web Page)

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests


app = Flask(__name__)
frontend_url = os.environ.get('FRONTEND_URL', 'https://code-ai-frontend.onrender.com')
CORS(app, resources={r"/api/*": {"origins": frontend_url}})

@app.route("/")
def index():
    return jsonify({"status": "ok"}), 200


@app.route('/api/generate', methods=['POST'])
def generate_code():
    try:
        data = request.json
        user_prompt = data.get('prompt')
        # We now expect a single 'language' string from the frontend
        language = data.get('language', 'javascript-web')

        if not user_prompt:
            return jsonify({"error": "Prompt is a required field"}), 400

        # --- THIS IS THE KEY LOGIC UPDATE ---
        # We provide a different, more specific instruction for the 'javascript-web' option.
        if language == 'javascript-web':
            system_prompt = """
            You are an expert web developer. Your task is to generate a single, complete, and self-contained HTML file
            based on the user's prompt.

            IMPORTANT:
            1.  The file must be a valid HTML5 document.
            2.  All necessary CSS must be included inside `<style>` tags in the document's `<head>`.
            3.  All necessary JavaScript logic must be included inside `<script>` tags at the end of the `<body>`.
            4.  Your entire response must be ONLY the raw HTML code. Do not include any explanations,
                conversational text, or markdown formatting like ```html ... ```.
            """
        else:
            # This is the prompt for generating simple code snippets for other languages.
            system_prompt = f"You are an expert programmer in {language}. Generate a code snippet for the following request. Only provide the raw code, no explanations."

        # --- GROQ API CALL ---
        groq_api_key = os.environ.get('GROQ_API_KEY')
        if not groq_api_key:
             return jsonify({"error": "GROQ_API_KEY not set in environment."}), 500

        groq_url = 'https://api.groq.com/openai/v1/chat/completions'
        headers = {
            'Authorization': f'Bearer {groq_api_key}',
            'Content-Type': 'application/json'
        }
        payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 3000
        }
        groq_response = requests.post(groq_url, headers=headers, json=payload)
        groq_response.raise_for_status()
        result = groq_response.json()
        generated_code = result['choices'][0]['message']['content'].strip()
        
        return jsonify({"code": generated_code})

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

