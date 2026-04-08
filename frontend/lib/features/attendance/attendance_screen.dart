import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/auth/auth_controller.dart";

class AttendanceScreen extends ConsumerWidget {
  const AttendanceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text("Attendance Check-In")),
      body: Center(
        child: ElevatedButton(
          onPressed: () async {
            final error = await ref.read(authControllerProvider.notifier).markAttendanceDone();
            if (error != null && context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
            }
          },
          child: const Text("Mark Attendance"),
        ),
      ),
    );
  }
}
