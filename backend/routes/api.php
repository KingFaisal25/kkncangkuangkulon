<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AttendanceRequestController;
use App\Http\Controllers\Api\WorkProgramController;
use App\Http\Controllers\Api\ActivityReportController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\DivisionReportController;
use App\Http\Controllers\Api\FinancialController;
use App\Http\Controllers\Api\RabController;
use App\Http\Controllers\Api\NotificationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'adminLogin']);


// Route to serve images from local disk if S3 is not used
Route::get('/images/{path}', function ($path) {
    // Basic security check to prevent directory traversal
    $path = str_replace(['..', '/', '\\'], '', $path);
    $fullPath = 'registrasi/' . $path;

    if (\Illuminate\Support\Facades\Storage::disk('local')->exists($fullPath)) {
        $file = \Illuminate\Support\Facades\Storage::disk('local')->get($fullPath);
        $type = \Illuminate\Support\Facades\Storage::disk('local')->mimeType($fullPath);
        return response($file, 200)->header('Content-Type', $type);
    }

    abort(404, 'Image not found');
});

// Authenticated routes (peserta + admin)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/attendance-requests', [AttendanceRequestController::class, 'index']);
    Route::post('/attendance-requests', [AttendanceRequestController::class, 'store']);

    Route::get('/work-programs', [WorkProgramController::class, 'index']);

    Route::get('/reports', [ActivityReportController::class, 'index']);
    Route::post('/reports', [ActivityReportController::class, 'store']);

    // Activities
    Route::get('/activities', [ActivityController::class, 'index']);

    // Attendance (peserta)
    Route::post('/attendance', [AttendanceController::class, 'store']);
    Route::get('/attendance/today', [AttendanceController::class, 'today']);
    Route::get('/attendance/history', [AttendanceController::class, 'history']);

    // -------- DIVISIONS --------
    Route::get('/divisions', [DivisionController::class, 'index']);

    // -------- DIVISION REPORTS (all users can read + submit) --------
    Route::get('/division-reports', [DivisionReportController::class, 'index']);
    Route::get('/division-reports/by-division', [DivisionReportController::class, 'byDivision']);
    Route::post('/division-reports', [DivisionReportController::class, 'store']);
    Route::put('/division-reports/{divisionReport}', [DivisionReportController::class, 'update']);
    Route::delete('/division-reports/{divisionReport}', [DivisionReportController::class, 'destroy']);

    // -------- FINANCIALS (all read; Bendahara + admin write) --------
    Route::get('/finance', [FinancialController::class, 'index']);
    Route::get('/finance/summary', [FinancialController::class, 'summary']);
    Route::post('/finance', [FinancialController::class, 'store']);
    Route::delete('/finance/{financialTransaction}', [FinancialController::class, 'destroy']);

    // -------- RAB WORKFLOW --------
    Route::get('/rab', [RabController::class, 'index']);
    Route::post('/rab', [RabController::class, 'store']);
    Route::get('/rab/{rabItem}', [RabController::class, 'show']);
    Route::put('/rab/{rabItem}', [RabController::class, 'update']);
    Route::delete('/rab/{rabItem}', [RabController::class, 'destroy']);
    Route::patch('/rab/{rabItem}/status', [RabController::class, 'status']);

    // -------- NOTIFICATIONS --------
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'read']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/attendance-requests', [AttendanceRequestController::class, 'index']);
        Route::patch('/attendance-requests/{attendanceRequest}', [AttendanceRequestController::class, 'update']);
        Route::get('/reports', [ActivityReportController::class, 'index']);
        Route::patch('/reports/{activityReport}/publish', [ActivityReportController::class, 'publish']);
        Route::delete('/reports/{activityReport}', [ActivityReportController::class, 'destroy']);
        Route::get('/work-programs', [WorkProgramController::class, 'index']);
        Route::post('/work-programs', [WorkProgramController::class, 'store']);
        Route::put('/work-programs/{workProgram}', [WorkProgramController::class, 'update']);
        Route::delete('/work-programs/{workProgram}', [WorkProgramController::class, 'destroy']);
        Route::get('/activities', [ActivityController::class, 'index']);
        Route::post('/activities', [ActivityController::class, 'store']);
        Route::put('/activities/{activity}', [ActivityController::class, 'update']);
        Route::delete('/activities/{activity}', [ActivityController::class, 'destroy']);
        Route::get('/dashboard/progress', [DashboardController::class, 'index']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'storeUser']);
        Route::get('/attendance', [AdminController::class, 'attendance']);
        Route::get('/attendance/summary', [AdminController::class, 'summary']);
        Route::get('/export', [AdminController::class, 'export']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

        // Admin-only division management
        Route::post('/divisions', [DivisionController::class, 'store']);
        Route::put('/divisions/{division}', [DivisionController::class, 'update']);
        Route::delete('/divisions/{division}', [DivisionController::class, 'destroy']);
        Route::post('/divisions/{division}/assign', [DivisionController::class, 'assignUser']);
        Route::post('/divisions/unassign', [DivisionController::class, 'unassignUser']);
    });
});



