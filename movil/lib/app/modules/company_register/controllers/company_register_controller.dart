import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:movil/app/services/main.service.dart';
import 'package:movil/constants.dart';
import 'package:movil/models/company.dart';
import 'package:movil/models/user.dart';

class CompanyRegisterController extends GetxController {
 
  @override
  void onInit() {
    super.onInit();
  }

  @override
  void onReady() {
    super.onReady();
  }

  final mainAPI = Get.put(MainAPI());

  final currentStep = 1.obs;
  final activeSection = 1.obs;
  final companyCode = TextEditingController();
  final companyName = TextEditingController();
  final companyAddress = TextEditingController();
  final userCode = TextEditingController();
  final userNames = TextEditingController();
  final userLastNames = TextEditingController();
  final userEmail = TextEditingController();
  final userPhone = TextEditingController();
  final locationSuccess = false.obs;
  final formValid = false.obs;
  final companyType = 'EG'.obs;

  final isNewCompany = false.obs;

  final isNewUser = false.obs;

  void cambiarSeccion(int seccion) {
    activeSection.value = seccion;
  }

  void nextStep() {
    if (currentStep.value < 3) {
      currentStep.value++;
    }
  }

  Future<void> escanearRuc() async {
    // Lógica para escanear RUC con cámara
    Get.snackbar('Escáner', 'Abriendo cámara...');
  }

  Future<void> obtenerUbicacion() async {
    // Lógica para obtener ubicación GPS
    locationSuccess.value = true;
    Get.snackbar('Ubicación', 'Ubicación obtenida exitosamente');
  }

  @override
  void onClose() {
    companyCode.dispose();
    super.onClose();
  }

  Future<void> verifyCompany() async {
    print("Estoy aqui");
    var result = await mainAPI.login(USER_READ, PASSWORD_READ);
    if (result["data"] == null) {

      return;
    }
    User userLoged = User.fromJson(result["data"]);
    bool saveSession = await mainAPI.setSession(userLoged);

    var resultCompany = await mainAPI.getEntityBy('companies', {"filter": [{"code": "OP001"}]});
    List<Company> companies = (resultCompany["data"] as Iterable).map((c) => Company.fromJson(c)).toList();
    isNewCompany.value = companies.isNotEmpty;
    nextStep();
  }

}
