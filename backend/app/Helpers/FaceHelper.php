<?php

namespace App\Helpers;

class FaceHelper
{
    /**
     * Calculate cosine similarity between two vectors.
     *
     * @param array $a First vector (128 floats)
     * @param array $b Second vector (128 floats)
     * @return float Cosine similarity score (0 to 1)
     */
    public static function cosineSimilarity(array $a, array $b): float
    {
        $dot = 0;
        $normA = 0;
        $normB = 0;

        $count = min(count($a), count($b));

        for ($i = 0; $i < $count; $i++) {
            $dot += $a[$i] * $b[$i];
            $normA += $a[$i] * $a[$i];
            $normB += $b[$i] * $b[$i];
        }

        if ($normA == 0 || $normB == 0) {
            return 0;
        }

        return $dot / (sqrt($normA) * sqrt($normB));
    }
}
