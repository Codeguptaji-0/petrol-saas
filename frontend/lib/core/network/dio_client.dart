import "package:dio/dio.dart";

class DioClient {
  DioClient(String baseUrl, {String? token})
      : dio = Dio(
          BaseOptions(
            baseUrl: baseUrl,
            connectTimeout: const Duration(seconds: 20),
            receiveTimeout: const Duration(seconds: 20),
            headers: token == null ? {} : {"Authorization": "Bearer $token"},
          ),
        );

  final Dio dio;
}
