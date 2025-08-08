<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Cek kalau user belum login atau role tidak sesuai
        if (!$request->user() || $request->user()->role !== $role) {
            // Kalau role admin, arahkan ke dashboard admin
            if ($request->user() && $request->user()->role === 'admin') {
                return redirect()->route('admin.posts.index');
            }

            // Kalau role selain admin, arahkan ke dashboard user
            return redirect()->route('user.posts.index');
        }

        // Kalau lolos semua pengecekan, teruskan request
        return $next($request);
    }
}
