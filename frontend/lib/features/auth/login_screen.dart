import "package:flutter/material.dart";
import "package:flutter_riverpod/flutter_riverpod.dart";
import "../../core/auth/auth_controller.dart";
import "../../core/auth/auth_state.dart";

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final usernameCtrl = TextEditingController();
    final passwordCtrl = TextEditingController();
    final baseUrlCtrl = TextEditingController(text: "http://localhost:3000");
    return Scaffold(
      appBar: AppBar(title: const Text("Login")),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: baseUrlCtrl,
              decoration: const InputDecoration(labelText: "Backend Base URL"),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: usernameCtrl,
              decoration: const InputDecoration(labelText: "Username"),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: passwordCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: "Password"),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final error = await ref.read(authControllerProvider.notifier).login(
                      username: usernameCtrl.text.trim(),
                      password: passwordCtrl.text.trim(),
                      baseUrl: baseUrlCtrl.text.trim(),
                    );
                if (error != null && context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error)));
                }
              },
              child: const Text("Login"),
            ),
            TextButton(
              onPressed: () => ref.read(authControllerProvider.notifier).loginMock(AppRole.admin),
              child: const Text("Use Mock Login"),
            )
          ],
        ),
      ),
    );
  }
}
