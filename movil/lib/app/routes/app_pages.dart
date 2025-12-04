import 'package:get/get.dart';

import '../modules/company_register/bindings/company_register_binding.dart';
import '../modules/company_register/views/company_register_view.dart';
import '../modules/home/bindings/home_binding.dart';
import '../modules/home/views/home_view.dart';

part 'app_routes.dart';

class AppPages {
  AppPages._();

  static const INITIAL = Routes.COMPANY_REGISTER;

  static final routes = [
    GetPage(
      name: _Paths.HOME,
      page: () => const HomeView(),
      binding: HomeBinding(),
    ),
    GetPage(
      name: _Paths.COMPANY_REGISTER,
      page: () => const CompanyRegisterView(),
      binding: CompanyRegisterBinding(),
    ),
  ];
}
