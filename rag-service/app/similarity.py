import numpy as np


def cosine_similarity(vector_a, vector_b):

    a = np.array(vector_a)
    b = np.array(vector_b)

    dot_product = np.dot(a, b)

    magnitude_a = np.linalg.norm(a)
    magnitude_b = np.linalg.norm(b)

    similarity = dot_product / (magnitude_a * magnitude_b)

    return similarity