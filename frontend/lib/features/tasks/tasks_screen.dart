import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/auth/auth_controller.dart";
import "../../core/network/api_service.dart";

class TasksScreen extends ConsumerWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    return Scaffold(
      appBar: AppBar(title: const Text("My Tasks")),
      body: FutureBuilder<List<dynamic>>(
        future: auth.token == null
            ? Future.value([])
            : ApiService(baseUrl: auth.backendBaseUrl).myTasks(token: auth.token!),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text("Failed to load tasks: ${snapshot.error}"));
          }
          final tasks = snapshot.data ?? [];
          if (tasks.isEmpty) {
            return const Center(child: Text("No tasks found"));
          }
          return ListView.builder(
            itemCount: tasks.length,
            itemBuilder: (context, index) {
              final task = tasks[index] as Map<String, dynamic>;
              return ListTile(
                title: Text((task["title"] ?? "Untitled").toString()),
                subtitle: Text("Status: ${(task["status"] ?? "NA").toString()}"),
              );
            },
          );
        },
      ),
    );
  }
}
