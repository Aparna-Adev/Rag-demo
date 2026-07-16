"""Find the most relevant document chunks for a question."""

from json import loads

from app.database import get_connection
from app.services.embeddings import create_embeddings


def search_chunks(
    query: str,
    owner_id: int,
    limit: int = 3,
) -> list[dict[str, object]]:
    """Return the highest-scoring chunks using cosine similarity."""
    query_embedding = create_embeddings([query])[0]

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                chunks.id,
                chunks.document_id,
                chunks.content,
                chunks.embedding,
                documents.filename
            FROM chunks
            JOIN documents ON documents.id = chunks.document_id
            WHERE chunks.embedding IS NOT NULL
            AND documents.owner_id = ?
            """,
            (owner_id,),
        ).fetchall()

    results = []

    for row in rows:
        chunk_embedding = loads(row["embedding"])

        # Vectors are normalized, so their dot product is cosine similarity.
        score = sum(
            query_value * chunk_value
            for query_value, chunk_value in zip(query_embedding, chunk_embedding)
        )

        results.append(
            {
                "chunk_id": row["id"],
                "document_id": row["document_id"],
                "filename": row["filename"],
                "content": row["content"],
                "score": round(score, 4),
            }
        )

    return sorted(results, key=lambda item: item["score"], reverse=True)[:limit]
