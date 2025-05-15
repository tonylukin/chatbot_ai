from flask import Flask, request, jsonify
import os
from exa_py import Exa
import anthropic
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize Exa and Claude clients
exa = Exa(os.getenv("EXA_API_KEY"))


@app.route("/api/search", methods=["POST"])
def search():
    data = request.json
    query = data.get("query")
    category = data.get("category", "auto")
    num_results = data.get("num_results", 2)

    results = exa.search(query, category=category, num_results=num_results)
    return jsonify(results.results)


@app.route("/api/ask", methods=["POST"])
def ask():
    data = request.json
    prompt = data.get("prompt")

    client = anthropic.Anthropic(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
    )
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return jsonify({"response": message.content[0].text})


@app.route("/test", methods=["GET"])
def test():
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True)
