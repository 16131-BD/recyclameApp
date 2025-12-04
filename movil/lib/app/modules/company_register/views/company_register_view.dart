import 'package:flutter/material.dart';

import 'package:get/get.dart';
import 'package:movil/constants.dart';

import '../controllers/company_register_controller.dart';

class CompanyRegisterView extends GetView<CompanyRegisterController> {
  const CompanyRegisterView({super.key});
  @override
  Widget build(BuildContext context) {

    final contentStep = Obx(() {
      switch (controller.currentStep.value) {
        case 1:
          return Container(
            decoration: BoxDecoration(
              border: Border.all(
                color: controller.activeSection.value == 1
                    ? mxDeHexAColor(COLOR_PRIMARIO)
                    : Colors.grey.shade300,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                // Header de sección
                Container(
                  padding: EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: controller.activeSection.value == 1
                        ? mxDeHexAColor(COLOR_PRIMARIO).withOpacity(0.1)
                        : Colors.white,
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(10),
                      topRight: Radius.circular(10),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: mxDeHexAColor(COLOR_PRIMARIO),
                        ),
                        child: Center(
                          child: Text(
                            '1',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(width: 12),
                      Text(
                        'Verificación de Empresa',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: mxDeHexAColor(COLOR_PRIMARIO),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Contenido de sección
                Container(
                  padding: EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                        color: Colors.grey.shade300,
                        style: BorderStyle.solid,
                      ),
                    ),
                  ),
                  child: Column(
                    children: [
                      // Botón escanear
                      InkWell(
                        onTap: () {
                          controller.cambiarSeccion(1);
                          controller.escanearRuc();
                        },
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 32, horizontal: 20),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: mxDeHexAColor(COLOR_SECUNDARIO),
                              width: 2,
                              style: BorderStyle.solid,
                            ),
                            borderRadius: BorderRadius.circular(12),
                            color: mxDeHexAColor(COLOR_PRIMARIO).withOpacity(0.05),
                          ),
                          child: Column(
                            children: [
                              Icon(
                                Icons.camera_alt_outlined,
                                size: 32,
                                color: mxDeHexAColor(COLOR_PRIMARIO),
                              ),
                              SizedBox(height: 12),
                              Text(
                                'Escanear RUC',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  color: mxDeHexAColor(COLOR_PRIMARIO),
                                ),
                              ),
                              SizedBox(height: 4),
                              Text(
                                'Use la cámara para escanear',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      // Divider
                      Padding(
                        padding: EdgeInsets.symmetric(vertical: 20),
                        child: Row(
                          children: [
                            Expanded(child: Divider(color: Colors.grey.shade300)),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 12),
                              child: Text(
                                'O INGRESE MANUALMENTE',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade500,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            Expanded(child: Divider(color: Colors.grey.shade300)),
                          ],
                        ),
                      ),
                      
                      constructorCampoDeTexto(
                        '',
                        controller.companyCode,
                        maxLength: 11,
                        keyboardType: TextInputType.number,
                        dense: true,
                        onChanged: (String? value) {
                          print(value);
                          controller.formValid.value = value!.isNotEmpty && value!.length == 11;
                        }
                      ),
                      !controller.formValid.value ?
                        Container()
                      :
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(height: 10,),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: mxDeHexAColor(COLOR_PRIMARIO)
                                  ),
                                  onPressed: () {
                                    controller.verifyCompany();
                                  }, 
                                  child: Text(
                                    "Verificar RUC",
                                    style: TextStyle(
                                      color: Colors.white
                                    ),
                                  )
                                )
                              ],
                            )

                          ],
                        )
                    ],
                  ),
                ),
              ],
            ),
          );
        case 2:
          if (controller.isNewCompany.value) {

            return Container(
              decoration: BoxDecoration(
                border: Border.all(
                  color: controller.activeSection.value == 1
                      ? mxDeHexAColor(COLOR_PRIMARIO)
                      : Colors.grey.shade300,
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  // Header de sección
                  constructorHeaderCard("Datos de la Empresa", 1, "2"),
                  
                  // Contenido de sección
                  Container(
                    padding: EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      border: Border(
                        top: BorderSide(
                          color: Colors.grey.shade300,
                          style: BorderStyle.solid,
                        ),
                      ),
                    ),
                    child: Column(
                      children: [
                        
                        constructorCampoDeTexto(
                          'Número de RUC',
                          controller.companyCode,
                          maxLength: 11,
                          keyboardType: TextInputType.number,
                          dense: true,
                          onChanged: (String? value) {
                            print(value);
                            controller.formValid.value = value!.isNotEmpty && value!.length == 11;
                          }
                        ),
                        SizedBox(height: 5,),
                        constructorCampoDeTexto(
                          'Razon Social',
                          controller.companyName,
                          maxLength: 500,
                          maxLines: 3,
                          keyboardType: TextInputType.number,
                          dense: true,
                        ),
                        SizedBox(height: 5,),
                        constructorCampoDeTexto(
                          'Dirección',
                          controller.companyAddress,
                          maxLength: 500,
                          maxLines: 3,
                          keyboardType: TextInputType.number,
                          dense: true,
                        ),
                        SizedBox(
                          height: 15,
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: controller.companyType.value == "EG" ? mxDeHexAColor(COLOR_APROBADO) : Colors.white
                              ),
                              onPressed: () {
                                controller.companyType.value = "EG";
                              }, 
                              child: Text(
                                "EG\nGenerador",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: controller.companyType.value == "EG" ? Colors.white : mxDeHexAColor(COLOR_APROBADO)
                                ),
                              )
                            ),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: controller.companyType.value == "EO" ? mxDeHexAColor(COLOR_APROBADO) : Colors.white
                              ),
                              onPressed: () {
                                controller.companyType.value = "EO";
                              }, 
                              child: Text(
                                "EO\nOperador",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: controller.companyType.value == "EO" ? Colors.white : mxDeHexAColor(COLOR_APROBADO)
                                ),
                              )
                            )
                          ],
                        )
                        // Column(
                        //   mainAxisAlignment: MainAxisAlignment.center,
                        //   crossAxisAlignment: CrossAxisAlignment.start,
                        //   children: [
                        //     SizedBox(height: 10,),
                        //     Row(
                        //       mainAxisAlignment: MainAxisAlignment.center,
                        //       children: [
                        //         ElevatedButton(
                        //           style: ElevatedButton.styleFrom(
                        //             backgroundColor: mxDeHexAColor(COLOR_PRIMARIO)
                        //           ),
                        //           onPressed: () {
                        //             controller.verifyCompany();
                        //           }, 
                        //           child: Text(
                        //             "Verificar RUC",
                        //             style: TextStyle(
                        //               color: Colors.white
                        //             ),
                        //           )
                        //         )
                        //       ],
                        //     )

                        //   ],
                        // )
                      ],
                    ),
                  ),

                  constructorHeaderCard("Datos del Representante Legal", 1, "3"),
                  
                  // Contenido de sección
                  Container(
                    padding: EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      border: Border(
                        top: BorderSide(
                          color: Colors.grey.shade300,
                          style: BorderStyle.solid,
                        ),
                      ),
                    ),
                    child: Column(
                      children: [
                        
                        constructorCampoDeTexto(
                          'Número de DNI',
                          controller.userCode,
                          maxLength: 11,
                          keyboardType: TextInputType.number,
                          dense: true,
                          onChanged: (String? value) {
                            print(value);
                            controller.formValid.value = value!.isNotEmpty && value!.length == 11;
                          }
                        ),
                        SizedBox(height: 5,),
                        constructorCampoDeTexto(
                          'Nombres',
                          controller.userNames,
                          maxLength: 100,
                          keyboardType: TextInputType.number,
                          dense: true,
                        ),
                        SizedBox(height: 5,),
                        constructorCampoDeTexto(
                          'Apellidos',
                          controller.userLastNames,
                          maxLength: 200,
                          keyboardType: TextInputType.number,
                          dense: true,
                        ),
                        SizedBox(height: 5,),
                        constructorCampoDeTexto(
                          'Correo Electrónico',
                          controller.userEmail,
                          maxLength: 200,
                          keyboardType: TextInputType.number,
                          dense: true,
                        ),
                        SizedBox(height: 5,),
                        constructorCampoDeTexto(
                          'Número de Celular',
                          controller.userPhone,
                          maxLength: 200,
                          keyboardType: TextInputType.number,
                          dense: true,
                        ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(height: 10,),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: mxDeHexAColor(COLOR_PRIMARIO)
                                  ),
                                  onPressed: () {
                                    controller.register();
                                  }, 
                                  child: Text(
                                    "Registrar Empresa",
                                    style: TextStyle(
                                      color: Colors.white
                                    ),
                                  )
                                )
                              ],
                            )

                          ],
                        )
                      ],
                    ),
                  ),
                ],
              ),
            );
          } else {
            return Container();
          }
        default:
          return Container();
      }
    });


    return Scaffold(
      backgroundColor: mxDeHexAColor(BG_LIGHT),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            child: Container(
              constraints: BoxConstraints(maxWidth: 400),
              margin: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Header
                  _construirEncabezado(),
                  
                  // Contenido
                  Padding(
                    padding: EdgeInsets.all(24),
                    child: Column(
                      children: [
                        // Sección 1: Autodetección de RUC
                        contentStep,
                        SizedBox(height: 24),
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      )
    );
  }

  Widget _construirEncabezado() {
    return Container(
      padding: EdgeInsets.only(left: 24, right: 24, top: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Column(
        children: [
          Text(
            'Registro de Empresa',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: mxDeHexAColor(COLOR_PRIMARIO),
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Complete el proceso de registro',
            style: TextStyle(
              fontSize: 14,
              color: mxDeHexAColor(COLOR_PRIMARIO),
            ),
          ),
        ],
      ),
    );
  }

}
