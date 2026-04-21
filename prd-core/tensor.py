import numpy as np

class RelationalTensor:
    def __init__(self, C=0.5, W=1.0, L="General", T=0.0, U=0.5, D=0):
        self.C = C  # Causality
        self.W = W  # Weight/Importance
        self.L = L  # Logic/Domain
        self.T = T  # Time/Sequence
        self.U = U  # Uncertainty
        self.D = D  # Dimension index

    def to_dict(self):
        return {
            "C": self.C, "W": self.W, "L": self.L,
            "T": self.T, "U": self.U, "D": self.D
        }
