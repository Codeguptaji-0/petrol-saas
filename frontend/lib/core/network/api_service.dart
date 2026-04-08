import "package:dio/dio.dart";

class ApiService {
  ApiService({required String baseUrl}) : _dio = Dio(BaseOptions(baseUrl: baseUrl));

  final Dio _dio;

  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
    required String deviceId,
  }) async {
    final response = await _dio.post(
      "/api/v1/auth/login",
      data: {"username": username, "password": password, "deviceId": deviceId},
    );
    return response.data as Map<String, dynamic>;
  }

  Future<void> checkIn({
    required String token,
    required double lat,
    required double lng,
  }) async {
    await _dio.post(
      "/api/v1/attendance/check-in",
      data: {"lat": lat, "lng": lng},
      options: Options(headers: {"Authorization": "Bearer $token"}),
    );
  }

  Future<List<dynamic>> myTasks({required String token}) async {
    final response = await _dio.get(
      "/api/v1/tasks/my",
      options: Options(headers: {"Authorization": "Bearer $token"}),
    );
    return response.data as List<dynamic>;
  }
}
