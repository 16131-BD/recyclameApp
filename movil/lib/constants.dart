import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:get/get.dart';
import 'package:get/get_state_manager/get_state_manager.dart';

const COLOR_PRIMARIO = '#178a30';
const COLOR_SECUNDARIO = '#9EE98F';
const BG_LIGHT = '#FDFDFD';
const APP_NAME = 'movil-app-001';
const USER_READ = "ulectura";
const PASSWORD_READ = "123456@.";

const API_URI = "http://192.168.1.18:3000/api";

void mxMensajePersonalizadoModal(String txTitulo, 
  IconData obIcon,
  Color obColor,
  String txImagen,
  String txMensaje, 
  [bool blRedireccionara = false, 
  String txRutaRedireccion = "",
  String txTextoBotonRedireccion = "", 
  bool blPuedeCerrarModal = false,
  String txRutaDeCierre = "-1"]
) {

  Get.dialog(Center(
    child: Container(
      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20)
      ),
      width: Get.width * 0.8,
      child: Wrap(
        crossAxisAlignment: WrapCrossAlignment.center,
        alignment: WrapAlignment.center,
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(obIcon, size: 60, color: obColor,),
              Text(
                txTitulo,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: mxDeHexAColor(COLOR_PRIMARIO),
                  fontFamily: 'Poppins',
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                  decoration: TextDecoration.none
                ),
              ),
              SizedBox(
                height: 5,
              ),
              Image.asset(
                "assets/imgs/$txImagen",
                height: 180,
                width: Get.width * 0.8,
              ),
              SizedBox(
                height: 5,
              ),
              Text(
                txMensaje,
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: mxDeHexAColor(COLOR_PRIMARIO),
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.normal,
                  fontSize: 12,
                  decoration: TextDecoration.none
                ),
              ),
              SizedBox(
                height: 20,
              ),
              blRedireccionara ? 
                Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              elevation: 0,
                              backgroundColor: mxDeHexAColor(COLOR_PRIMARIO),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadiusGeometry.circular(20),
                                side: BorderSide(
                                  width: 1,
                                  color: mxDeHexAColor(COLOR_PRIMARIO)
                                )
                              )
                            ),
                            onPressed: () {
                              Get.offAllNamed(txRutaRedireccion);
                            }, 
                            child: Text(
                              txTextoBotonRedireccion,
                              style: TextStyle(
                                color: Colors.white
                              ),
                            )
                          )
                        )
                      ],
                    ),
                    SizedBox(
                      height: 10,
                    ),
                  ],
                )
              :
                Container()
              ,
              blPuedeCerrarModal ? 
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          elevation: 0,
                          backgroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadiusGeometry.circular(20),
                            side: BorderSide(
                              width: 1,
                              color: mxDeHexAColor(COLOR_PRIMARIO)
                            )
                          )
                        ),
                        onPressed: () {
                          if (txRutaDeCierre == "-1") {
                            Get.close(1);
                          } else {
                            Get.offAllNamed(txRutaDeCierre);
                          }
                        }, 
                        child: Text(
                          "Cerrar",
                          style: TextStyle(
                            color: mxDeHexAColor(COLOR_PRIMARIO)
                          ),
                        )
                      )
                    )
                  ],
                )
              :
                Container()
              ,
              SizedBox(
                height: 10,
              )
            ],
          )
        ],
      ),
    ),
  ), barrierDismissible: false);
}


// Widget _construirIndicadoresProgreso() {
//   return Obx(() => Container(
//     padding: EdgeInsets.symmetric(vertical: 20),
//     child: Row(
//       mainAxisAlignment: MainAxisAlignment.center,
//       children: List.generate(3, (index) {
//         return Container(
//           margin: EdgeInsets.symmetric(horizontal: 6),
//           width: 10,
//           height: 10,
//           decoration: BoxDecoration(
//             shape: BoxShape.circle,
//             color: (index + 1) == controller.rxPasoActual.value
//                 ? mxDeHexAColor(COLOR_PRIMARIO)
//                 : mxDeHexAColor('#E0D5C7'),
//           ),
//         );
//       }),
//     ),
//   ));
// }


// Widget _construirSeccionUbicacion() {
//   return Obx(() => Opacity(
//     opacity: controller.rxSeccionActiva.value == 2 ? 1.0 : 0.6,
//     child: Container(
//       decoration: BoxDecoration(
//         border: Border.all(
//           color: controller.rxSeccionActiva.value == 2
//               ? mxDeHexAColor(COLOR_PRIMARIO)
//               : Colors.grey.shade300,
//           width: 2,
//         ),
//         borderRadius: BorderRadius.circular(12),
//       ),
//       child: Column(
//         children: [
//           // Header de sección
//           Container(
//             padding: EdgeInsets.all(16),
//             decoration: BoxDecoration(
//               color: controller.rxSeccionActiva.value == 2
//                   ? mxDeHexAColor(COLOR_PRIMARIO).withOpacity(0.1)
//                   : Colors.white,
//               borderRadius: BorderRadius.only(
//                 topLeft: Radius.circular(10),
//                 topRight: Radius.circular(10),
//               ),
//             ),
//             child: Row(
//               children: [
//                 Container(
//                   width: 32,
//                   height: 32,
//                   decoration: BoxDecoration(
//                     shape: BoxShape.circle,
//                     color: controller.rxSeccionActiva.value == 2
//                         ? mxDeHexAColor(COLOR_PRIMARIO)
//                         : Colors.grey.shade500,
//                   ),
//                   child: Center(
//                     child: Text(
//                       '2',
//                       style: TextStyle(
//                         color: Colors.white,
//                         fontWeight: FontWeight.bold,
//                         fontSize: 16,
//                       ),
//                     ),
//                   ),
//                 ),
//                 SizedBox(width: 12),
//                 Text(
//                   'Verificar Ubicación',
//                   style: TextStyle(
//                     fontSize: 15,
//                     fontWeight: FontWeight.w600,
//                     color: controller.rxSeccionActiva.value == 2
//                         ? mxDeHexAColor(COLOR_PRIMARIO)
//                         : Colors.grey.shade600,
//                   ),
//                 ),
//               ],
//             ),
//           ),
          
//           // Contenido de sección
//           Container(
//             padding: EdgeInsets.all(20),
//             decoration: BoxDecoration(
//               border: Border(
//                 top: BorderSide(
//                   color: Colors.grey.shade300,
//                   style: BorderStyle.solid,
//                 ),
//               ),
//             ),
//             child: InkWell(
//               onTap: () {
//                 controller.cambiarSeccion(2);
//                 controller.obtenerUbicacion();
//               },
//               child: Container(
//                 padding: EdgeInsets.all(20),
//                 decoration: BoxDecoration(
//                   border: Border.all(
//                     color: mxDeHexAColor(COLOR_SECUNDARIO),
//                   ),
//                   borderRadius: BorderRadius.circular(10),
//                   color: Colors.white,
//                 ),
//                 child: Row(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     Icon(
//                       Icons.location_on_outlined,
//                       size: 20,
//                       color: mxDeHexAColor(COLOR_PRIMARIO),
//                     ),
//                     SizedBox(width: 10),
//                     Text(
//                       'Obtener Ubicación',
//                       style: TextStyle(
//                         fontSize: 15,
//                         fontWeight: FontWeight.w500,
//                         color: mxDeHexAColor(COLOR_PRIMARIO),
//                       ),
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//           ),
//         ],
//       ),
//     ),
//   ));
// }

// Widget _construirBotonContinuar() {
//   return InkWell(
//     onTap: () => controller.continuar(),
//     child: Container(
//       width: double.infinity,
//       padding: EdgeInsets.all(16),
//       decoration: BoxDecoration(
//         color: mxDeHexAColor(COLOR_PRIMARIO),
//         borderRadius: BorderRadius.circular(12),
//       ),
//       child: Row(
//         mainAxisAlignment: MainAxisAlignment.center,
//         children: [
//           Text(
//             'Continuar',
//             style: TextStyle(
//               fontSize: 16,
//               fontWeight: FontWeight.w600,
//               color: Colors.white,
//             ),
//           ),
//           SizedBox(width: 8),
//           Icon(
//             Icons.arrow_forward,
//             size: 20,
//             color: Colors.white,
//           ),
//         ],
//       ),
//     ),
//   );
// }

// Widget _construirLinkInicioSesion() {
//   return Row(
//     mainAxisAlignment: MainAxisAlignment.center,
//     children: [
//       Text(
//         '¿Ya tienes cuenta? ',
//         style: TextStyle(
//           fontSize: 14,
//           color: Colors.grey.shade600,
//         ),
//       ),
//       InkWell(
//         onTap: () {
//           // Navegar a inicio de sesión
//         },
//         child: Text(
//           'Inicia sesión',
//           style: TextStyle(
//             fontSize: 14,
//             color: mxDeHexAColor(COLOR_PRIMARIO),
//             fontWeight: FontWeight.w600,
//           ),
//         ),
//       ),
//     ],
//   );
// }
// }

// Función helper para convertir hex a Color
Color mxDeHexAColor(String hexColor) {
  hexColor = hexColor.replaceAll("#", "");
  if (hexColor.length == 6) {
    hexColor = "FF" + hexColor;
  }
  return Color(int.parse(hexColor, radix: 16));
}


// Incluir la función constructorCampoDeTexto del documento
Widget constructorCampoDeTexto(
  String txEtiqueta,
  TextEditingController obControlador, {
  int maxLines = 1,
  TextInputType? keyboardType,
  bool? enabled = true,
  int maxLength = 500,
  bool? dense = true,
  void Function(String?)? onChanged,
}) {

  return Row(
    children: [
      Expanded(
        child: TextFormField(
          controller: obControlador,
          maxLength: maxLength,
          maxLines: maxLines,
          enabled: enabled,
          decoration: InputDecoration(
            counter: Offstage(),
            isDense: dense,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(color: mxDeHexAColor(COLOR_PRIMARIO)),
            ),
            labelText: txEtiqueta.isEmpty ? null : txEtiqueta,
            hintText: txEtiqueta.isEmpty ? '20123456789' : null,
            contentPadding: EdgeInsets.all(14),
            labelStyle: TextStyle(
              color: mxDeHexAColor(COLOR_PRIMARIO),
              fontSize: 13,
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide(
                color: mxDeHexAColor(COLOR_PRIMARIO),
                width: 2,
              ),
            ),
          ),
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            letterSpacing: 1,
          ),
          keyboardType: keyboardType,
          onChanged: onChanged,
        ),
      ),
    ],
  );
}


Widget constructorHeaderCard(
  String title,
  int activeSection,
  String step
) {

  return Container(
    padding: EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: activeSection == 1
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
              step,
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
          title,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: mxDeHexAColor(COLOR_PRIMARIO),
          ),
        ),
      ],
    ),
  );;
}
