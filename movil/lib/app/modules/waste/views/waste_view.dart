import 'package:flutter/material.dart';

import 'package:get/get.dart';

import '../controllers/waste_controller.dart';

class WasteView extends GetView<WasteController> {
  const WasteView({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('WasteView'),
        centerTitle: true,
      ),
      body: const Center(
        child: Text(
          'WasteView is working',
          style: TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}
