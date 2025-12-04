import 'package:get/get.dart';

class HomeController extends GetxController {
  //TODO: Implement HomeController

  final count = 0.obs;
  @override
  void onInit() {
    super.onInit();
  }

  @override
  void onReady() {
    super.onReady();
  }

  @override
  void onClose() {
    super.onClose();
  }

  void increment() => count.value++;
}


/**
 
import 'package:flutter/material.dart';
import 'package:get/get.dart';

// Controller
class DashboardController extends GetxController {
  final rxLotesActivos = 12.obs;
  final rxEnTransporte = 8.obs;
  final rxPublicados = 15.obs;
  
  final rxActividadReciente = <Map<String, dynamic>>[
    {
      'titulo': 'Lote #CAF-2024-001',
      'subtitulo': 'Estado: Almacenado',
      'tiempo': 'Hace 2 horas',
      'icono': Icons.warehouse_outlined,
      'color': '#4CAF50',
    },
    {
      'titulo': 'Lote #CAF-2024-002',
      'subtitulo': 'En transporte a Lima',
      'tiempo': 'Hace 5 horas',
      'icono': Icons.local_shipping_outlined,
      'color': '#FF9800',
    },
  ].obs;

  void navegarANuevoLote() {
    Get.snackbar('Navegar', 'Ir a Nuevo Lote');
  }

  void navegarAMisLotes() {
    Get.snackbar('Navegar', 'Ir a Mis Lotes');
  }

  void navegarATransporte() {
    Get.snackbar('Navegar', 'Ir a Transporte');
  }

  void navegarAReportes() {
    Get.snackbar('Navegar', 'Ir a Reportes');
  }

 */