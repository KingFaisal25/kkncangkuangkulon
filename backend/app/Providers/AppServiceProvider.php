<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Railway Nixpacks hack: Override database config at runtime to bypass poisoned config cache
        // We do this in register() to ensure it modifies the config BEFORE the DatabaseManager resolves the connection
        if (env('DATABASE_PUBLIC_URL') || env('DATABASE_URL') || env('PGHOST')) {
            config([
                'database.default' => 'pgsql',
            ]);
            
            $dbUrl = env('DATABASE_URL');
            $parsedUrl = $dbUrl ? parse_url($dbUrl) : [];
            
            $password = env('PGPASSWORD') ?: ($parsedUrl['pass'] ?? null);
            $username = env('PGUSER') ?: ($parsedUrl['user'] ?? 'postgres');
            $database = env('PGDATABASE') ?: ltrim($parsedUrl['path'] ?? '/railway', '/');
            
            // We use the EXACT Public TCP Proxy you showed in the screenshot
            // to 100% bypass the broken internal 'postgres.railway.internal' network
            config([
                'database.connections.pgsql.url' => null, // Nuke URL so it doesn't override our manual host
                'database.connections.pgsql.host' => 'tokaido.proxy.rlwy.net',
                'database.connections.pgsql.port' => 58544,
                'database.connections.pgsql.database' => $database,
                'database.connections.pgsql.username' => $username,
                'database.connections.pgsql.password' => $password,
            ]);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
