import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:movil/app/routes/app_pages.dart';
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
  final companyId = num.parse('0').obs;

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

    var resultCompany = await mainAPI.getEntityBy('companies', {"filter": [{"code": companyCode.value.text}]});
    List<Company> companies = (resultCompany["data"] as Iterable).map((c) => Company.fromJson(c)).toList();
    isNewCompany.value = companies.isEmpty;
    if (!isNewCompany.value) {
      
    }
    nextStep();
  }

  Future<void> register() async {
    if (isNewCompany.value) {
      var body = {
        "news": [
          {
            "address": "Prolongación Calixto 553 - Huancayo",
            "code": companyCode.value.text,
            "contact_name": "${userNames.value.text} ${userLastNames.value.text}",
            "email": userEmail.value.text,
            "is_active": true,
            "company_type": companyType.value == "EG" ? 4 : 5,
            "name": companyName.value.text,
            "phone": userPhone.value.text
          }
        ]
      };

      var resultCompany = await mainAPI.setEntityBy("companies", body);
      print(resultCompany);

      companyId.value = resultCompany["data"][0]["id"];

      var bodyCompanyRequest = {
        "news": [
          {
            "company_name": companyName.value.text,
            "ruc": companyCode.value.text,
            "company_type": companyType.value == "EG" ? 4 : 5,
            "business_type": companyType.value == "EG" ? "GEN" : "OPE",
            "address": companyAddress.value.text,
            "phone": userPhone.value.text,
            "email": userEmail.value.text,
            "contact_name": "${userNames.value.text} ${userLastNames.value.text}",
            "contact_email": userEmail.value.text,
            "contact_phone": userPhone.value.text,
            "legal_rep_name": "${userNames.value.text} ${userLastNames.value.text}",
            "legal_rep_email": userEmail.value.text,
            "legal_rep_phone": userPhone.value.text,
            "legal_rep_dni": userCode.value.text,
            "status": "pending"
          }
        ]
      };

      var resultCompanyRequest = await mainAPI.setEntityBy("company_requests", bodyCompanyRequest);
      print(resultCompanyRequest);

    }  

    var bodyUser = {
      "news": [
        {
          "company_id": companyId.value,
          "email": userEmail.value.text,
          "is_active": true,
          "is_primary": true,
          "last_names": userLastNames.value.text,
          "names": userNames.value.text,
          "password": generateTextRandom(8),
          "phone": userPhone.value.text,
          "user_type": 2
        }
      ]
    };

    var resultUser = await mainAPI.setEntityBy('users', bodyUser);
    print(resultUser);


    var bodyAffiliationRequest = {
      "news": [
        {
          "code": "${generateTextRandom(6)}",
          "company_id": companyId.value,
          "applicant": {
            "user_id": resultUser["data"][0]["id"],
            "name": "${userNames.value.text} ${userLastNames.value.text}",
            "email": userEmail.value.text,
            "phone": userPhone.value.text,
            "document_type": "DNI",
            "document_number": userCode.value.text,
            "requested_role": companyType.value == "EG" ? "Generador" : "Operador",
          },
          "status": "pending",
          "message": "Solicito acceso al sistema para gestionar operaciones.",
          "modules": {
            "dashboard": false,
            "companies": false,
            "users": false,
            "residues": false,
            "plants": false,
            "operations": false
          },
        }
      ]
    };

    var resultAffilition = await mainAPI.setEntityBy("affiliation_requests", bodyAffiliationRequest);
    print(resultAffilition);

    mxMensajePersonalizadoModal("Listo!", Icons.check, mxDeHexAColor(COLOR_APROBADO), "success_event.png", "Se realizo la operación satisfactoriamete");

    Future.delayed(Duration(seconds: 3), () {
      Get.offAllNamed(Routes.LOGIN);
    });


  }

}
