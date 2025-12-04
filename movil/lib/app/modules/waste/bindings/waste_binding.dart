import 'package:get/get.dart';

import '../controllers/waste_controller.dart';

class WasteBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<WasteController>(
      () => WasteController(),
    );
  }
}
