from llama_cpp import Llama

MODEL_PATH = "models/gemma-3-1b-it-UD-Q8_K_XL.gguf"  # change if needed

print("Loading model...")

llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=8,
)

print("Model loaded successfully!")

prompt = "Tell me a joke to laugh my ass out!"

response = llm(
    prompt,
    max_tokens=100,
    stop=["Q:", "\n"],
)

print("\nResponse:")
print(response["choices"][0]["text"])