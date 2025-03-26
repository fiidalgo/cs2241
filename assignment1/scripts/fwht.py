import numpy as np

def fast_walsh_hadamard_transform(x):
    """
    In-place Fast Walsh-Hadamard Transform of x (length must be a power of 2).
    """
    n = len(x)
    h = 1
    while h < n:
        for i in range(0, n, h*2):
            for j in range(i, i+h):
                a = x[j]
                b = x[j+h]
                x[j]   = a + b
                x[j+h] = a - b
        h *= 2
    return x

def inverse_fast_walsh_hadamard_transform(x):
    """
    Inverse of FWHT up to a 1/n scaling factor. We'll do the same transform again
    and then divide by n to get the true inverse of the orthonormal version.
    """
    fast_walsh_hadamard_transform(x)
    return x

def random_point_on_sphere(d):
    """
    Generate a random point on the d-dimensional unit sphere.
    """
    gauss = np.random.randn(d)
    norm = np.linalg.norm(gauss)
    return gauss / norm

def randomized_hadamard_transform(x):
    """
    Applies random sign flips and the FWHT. Returns (transformed_vector, sign_flips).
    """
    n = len(x)
    signs = np.random.choice([-1, 1], size=n)
    x_flipped = x * signs
    y = fast_walsh_hadamard_transform(x_flipped.copy())
    # no normalization here
    return y, signs

def inverse_randomized_hadamard_transform(y, signs):
    """
    Invert the randomized hadamard transform. After FWHT, scale by 1/len(y) then
    flip signs back.
    """
    n = len(y)
    y_inv = inverse_fast_walsh_hadamard_transform(y.copy())
    y_inv = y_inv / n
    return y_inv * signs

def experiment(d=1024, trials=100):
    errors = []
    for _ in range(trials):
        # 1) random unit sphere point
        x_orig = random_point_on_sphere(d)
        # 2) RHT
        y, flips = randomized_hadamard_transform(x_orig)
        # 3) quantize
        y_quant = np.sign(y)
        # 4) inverse
        x_rec = inverse_randomized_hadamard_transform(y_quant, flips)
        # 5) MSE
        mse = np.mean((x_rec - x_orig)**2)
        errors.append(mse)
    return min(errors), np.mean(errors), max(errors)

if __name__ == "__main__":
    mn, avg, mx = experiment(d=1024, trials=100)
    print(f"Min MSE:  {mn}")
    print(f"Mean MSE: {avg}")
    print(f"Max MSE:  {mx}")