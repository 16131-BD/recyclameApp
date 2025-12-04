import 'package:get/get.dart';

import '../controllers/company_register_controller.dart';

class CompanyRegisterBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<CompanyRegisterController>(
      () => CompanyRegisterController(),
    );
  }
}
