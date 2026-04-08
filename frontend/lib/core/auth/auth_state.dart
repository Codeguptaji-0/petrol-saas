enum AppRole { admin, manager, accountant, dsm, cleaning }

class AuthState {
  const AuthState({
    this.token,
    this.role,
    this.username,
    this.backendBaseUrl = "http://localhost:3000",
    this.attendanceMarked = false,
    this.isAuthenticated = false,
  });

  final String? token;
  final AppRole? role;
  final String? username;
  final String backendBaseUrl;
  final bool attendanceMarked;
  final bool isAuthenticated;

  AuthState copyWith({
    String? token,
    AppRole? role,
    String? username,
    String? backendBaseUrl,
    bool? attendanceMarked,
    bool? isAuthenticated,
  }) {
    return AuthState(
      token: token ?? this.token,
      role: role ?? this.role,
      username: username ?? this.username,
      backendBaseUrl: backendBaseUrl ?? this.backendBaseUrl,
      attendanceMarked: attendanceMarked ?? this.attendanceMarked,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
    );
  }
}
