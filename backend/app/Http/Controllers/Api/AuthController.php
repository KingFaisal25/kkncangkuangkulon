<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new participant.
     */
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'nim' => 'required|string|max:50|unique:users,nim',
                'jurusan' => 'required|string|max:255',
                'password' => 'required|string|min:6',
                'foto_registrasi' => 'required|string',
                'face_embedding' => 'required|array|size:128',
                'face_embedding.*' => 'required|numeric',
            ], [
                'nama.required' => 'Nama harus diisi.',
                'nim.required' => 'NIM harus diisi.',
                'nim.unique' => 'NIM sudah terdaftar.',
                'jurusan.required' => 'Jurusan harus diisi.',
                'password.required' => 'Password harus diisi.',
                'password.min' => 'Password minimal 6 karakter.',
                'foto_registrasi.required' => 'Foto registrasi harus diisi.',
                'face_embedding.required' => 'Face embedding harus diisi.',
                'face_embedding.size' => 'Face embedding harus berisi 128 nilai.',
            ]);

            // Save base64 photo directly to database to avoid ephemeral disk loss
            $fotoPath = null;
            if ($request->foto_registrasi) {
                // Keep the base64 format (with or without data:image prefix)
                // so it can be served directly via data URI
                $fotoPath = $request->foto_registrasi;
                
                // Ensure it's a valid data URI or base64
                if (!str_starts_with($fotoPath, 'data:image')) {
                    $fotoPath = 'data:image/jpeg;base64,' . $fotoPath;
                }
            }

            // Create user
            $user = User::create([
                'nama' => $validated['nama'],
                'nim' => $validated['nim'],
                'jurusan' => $validated['jurusan'],
                'password' => $validated['password'],
                'foto_registrasi' => $fotoPath,
                'face_embedding' => $validated['face_embedding'],
                'role' => 'peserta',
            ]);

            // Create Sanctum token
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil.',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'data' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    /**
     * Login for participants.
     */
    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'nim' => 'required|string',
                'password' => 'required|string',
            ], [
                'nim.required' => 'NIM harus diisi.',
                'password.required' => 'Password harus diisi.',
            ]);

            $user = User::where('nim', $validated['nim'])->first();

            if (!$user || !\Illuminate\Support\Facades\Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'NIM atau password salah.',
                    'data' => null,
                ], 401);
            }

            // Revoke old tokens
            $user->tokens()->delete();

            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil.',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'data' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    /**
     * Login for admin users.
     */
    public function adminLogin(Request $request)
    {
        try {
            $validated = $request->validate([
                'nim' => 'required|string',
                'password' => 'required|string',
            ], [
                'nim.required' => 'Username harus diisi.',
                'password.required' => 'Password harus diisi.',
            ]);

            $user = User::where('nim', $validated['nim'])->first();

            if (!$user || !\Illuminate\Support\Facades\Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username atau password salah.',
                    'data' => null,
                ], 401);
            }

            if ($user->role !== 'admin') {
                Auth::logout();
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Anda bukan admin.',
                    'data' => null,
                ], 403);
            }

            // Revoke old tokens
            $user->tokens()->delete();

            $token = $user->createToken('admin-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login admin berhasil.',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'data' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    /**
     * Logout and revoke current token.
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil.',
                'data' => null,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }

    /**
     * Get authenticated user profile.
     */
    public function user(Request $request)
    {
        try {
            $user = $request->user();
            $user->loadCount('attendance');

            return response()->json([
                'success' => true,
                'message' => 'Data user berhasil diambil.',
                'data' => [
                    'user' => $user,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'data' => null,
            ], 500);
        }
    }
}
