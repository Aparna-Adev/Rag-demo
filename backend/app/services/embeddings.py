"""Create local vector embeddings for RAG retrieval."""

from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    """Load the embedding model once and reuse it."""
    global model

    if model is None:
        model = SentenceTransformer(MODEL_NAME)

    return model


def create_embeddings(texts: list[str]) -> list[list[float]]:
    """Convert text chunks into normalized vector embeddings."""
    embedding_model = get_model()

    return embedding_model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=False,
    ).tolist()
