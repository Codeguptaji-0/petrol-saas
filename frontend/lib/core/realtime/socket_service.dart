import "package:socket_io_client/socket_io_client.dart" as io;

class SocketService {
  io.Socket connect({
    required String baseUrl,
    required String token,
    required String tenantId,
    String? pumpId,
    required String userId,
  }) {
    return io.io(
      "$baseUrl/realtime",
      io.OptionBuilder()
          .setTransports(["websocket"])
          .setAuth({
            "token": token,
            "tenantId": tenantId,
            "pumpId": pumpId,
            "userId": userId,
          })
          .enableAutoConnect()
          .build(),
    );
  }
}
