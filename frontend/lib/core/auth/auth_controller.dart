import "package:flutter_riverpod/flutter_riverpod.dart";
import "auth_state.dart";
import "../network/api_service.dart";

class AuthController extends StateNotifier<AuthState> {
  AuthController() : super(const AuthState());

  AppRole _mapRole(String role) {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return AppRole.admin;
      case "MANAGER":
        return AppRole.manager;
      case "ACCOUNTANT":
        return AppRole.accountant;
      case "CLEANING":
        return AppRole.cleaning;
      case "DSM":
      default:
        return AppRole.dsm;
    }
  }

  Future<String?> login({
    required String username,
    required String password,
    required String baseUrl,
  }) async {
    try {
      final api = ApiService(baseUrl: baseUrl);
      final data = await api.login(
        username: username,
        password: password,
        deviceId: "flutter-device",
      );
      final user = data["user"] as Map<String, dynamic>;
      final role = _mapRole(user["role"] as String);
      state = state.copyWith(
        token: data["accessToken"] as String,
        role: role,
        username: username,
        backendBaseUrl: baseUrl,
        isAuthenticated: true,
        attendanceMarked: false,
      );
      return null;
    } catch (e) {
      return "Login failed: $e";
    }
  }

  void loginMock(AppRole role) {
    state = state.copyWith(
      token: "mock-token",
      role: role,
      username: "mock-user",
      isAuthenticated: true,
      attendanceMarked: false,
    );
  }

  Future<String?> markAttendanceDone() async {
    try {
      final token = state.token;
      if (token == null) return "No access token available";
      final api = ApiService(baseUrl: state.backendBaseUrl);
      await api.checkIn(token: token, lat: 22.5726, lng: 88.3639);
      state = state.copyWith(attendanceMarked: true);
      return null;
    } catch (e) {
      return "Attendance failed: $e";
    }
  }

  void logout() {
    state = const AuthState();
  }
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController();
});
