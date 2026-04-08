import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "package:go_router/go_router.dart";
import "../../core/auth/auth_controller.dart";
import "../../core/auth/auth_state.dart";

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  String _labelForRole(AppRole? role) {
    switch (role) {
      case AppRole.admin:
        return "Admin Dashboard";
      case AppRole.manager:
        return "Manager Dashboard";
      case AppRole.accountant:
        return "Accountant Dashboard";
      case AppRole.dsm:
        return "DSM Dashboard";
      case AppRole.cleaning:
        return "Cleaning Dashboard";
      case null:
        return "Dashboard";
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authControllerProvider);
    return Scaffold(
      appBar: AppBar(
        title: Text(_labelForRole(auth.role)),
        actions: [
          IconButton(
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text("Enterprise home dashboard ready."),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go("/tasks"),
              child: const Text("Open My Tasks"),
            )
          ],
        ),
      ),
    );
  }
}
