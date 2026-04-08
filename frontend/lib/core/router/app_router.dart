import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../../features/attendance/attendance_screen.dart";
import "../../features/auth/login_screen.dart";
import "../../features/dashboard/home_screen.dart";
import "../../features/tasks/tasks_screen.dart";
import "../auth/auth_controller.dart";

final appRouterProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authControllerProvider);
  return GoRouter(
    initialLocation: "/login",
    redirect: (context, state) {
      final isLogin = state.matchedLocation == "/login";
      if (!auth.isAuthenticated) return isLogin ? null : "/login";
      if (!auth.attendanceMarked && state.matchedLocation != "/attendance") {
        return "/attendance";
      }
      if (auth.attendanceMarked && isLogin) return "/home";
      return null;
    },
    routes: [
      GoRoute(
        path: "/login",
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: "/attendance",
        builder: (context, state) => const AttendanceScreen(),
      ),
      GoRoute(
        path: "/home",
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: "/tasks",
        builder: (context, state) => const TasksScreen(),
      ),
    ],
  );
});
