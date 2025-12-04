import 'package:flutter/material.dart';

import 'package:get/get.dart';

import '../controllers/home_controller.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HomeView'),
        centerTitle: true,
      ),
      body: const Center(
        child: Text(
          'HomeView is working',
          style: TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}

/**

return Scaffold(
      backgroundColor: mxDeHexAColor(BG_LIGHT),
      body: SafeArea(
        child: Column(
          children: [
            // Header con información del usuario
            _construirHeader(),
            
            // Contenido principal con scroll
            Expanded(
              child: SingleChildScrollView(
                padding: EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Tarjetas de estadísticas
                    _construirTarjetasEstadisticas(),
                    
                    SizedBox(height: 32),
                    
                    // Acciones Rápidas
                    _construirSeccionAccionesRapidas(),
                    
                    SizedBox(height: 32),
                    
                    // Actividad Reciente
                    _construirSeccionActividadReciente(),
                    
                    SizedBox(height: 80), // Espacio para el bottom nav
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _construirBottomNavigationBar(),
    );
  }

  Widget _construirHeader() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: BoxDecoration(
        color: mxDeHexAColor(COLOR_PRIMARIO),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(20),
          bottomRight: Radius.circular(20),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withOpacity(0.2),
                ),
                child: Icon(
                  Icons.person,
                  color: Colors.white,
                  size: 24,
                ),
              ),
              SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Juan Pérez',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    'CAFE DEL PERÚ S.A.C.',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                ],
              ),
            ],
          ),
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withOpacity(0.2),
            ),
            child: IconButton(
              icon: Icon(Icons.settings, color: Colors.white, size: 20),
              onPressed: () {},
              padding: EdgeInsets.zero,
            ),
          ),
        ],
      ),
    );
  }

  Widget _construirTarjetasEstadisticas() {
    return Obx(() => Row(
      children: [
        Expanded(
          child: _construirTarjetaEstadistica(
            '${controller.rxLotesActivos.value}',
            'Lotes Activos',
            mxDeHexAColor('#4CAF50'),
          ),
        ),
        SizedBox(width: 12),
        Expanded(
          child: _construirTarjetaEstadistica(
            '${controller.rxEnTransporte.value}',
            'En Transporte',
            mxDeHexAColor('#FF9800'),
          ),
        ),
        SizedBox(width: 12),
        Expanded(
          child: _construirTarjetaEstadistica(
            '${controller.rxPublicados.value}',
            'Publicados',
            mxDeHexAColor('#9C27B0'),
          ),
        ),
      ],
    ));
  }

  Widget _construirTarjetaEstadistica(String valor, String label, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color,
            ),
          ),
          SizedBox(height: 12),
          Text(
            valor,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _construirSeccionAccionesRapidas() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Acciones Rápidas',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _construirTarjetaAccion(
                'Nuevo Lote',
                'Registrar café',
                Icons.add,
                mxDeHexAColor(COLOR_PRIMARIO),
                controller.navegarANuevoLote,
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: _construirTarjetaAccion(
                'Mis Lotes',
                'Ver seguimiento',
                Icons.inventory_2_outlined,
                mxDeHexAColor('#4A7C59'),
                controller.navegarAMisLotes,
              ),
            ),
          ],
        ),
        SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _construirTarjetaAccion(
                'Transporte',
                'Seguimiento GPS',
                Icons.local_shipping_outlined,
                mxDeHexAColor('#F59E0B'),
                controller.navegarATransporte,
              ),
            ),
            SizedBox(width: 12),
            Expanded(
              child: _construirTarjetaAccion(
                'Reportes',
                'Estadísticas',
                Icons.bar_chart,
                mxDeHexAColor('#059669'),
                controller.navegarAReportes,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _construirTarjetaAccion(
    String titulo,
    String subtitulo,
    IconData icono,
    Color color,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.3),
              blurRadius: 8,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icono,
                color: Colors.white,
                size: 24,
              ),
            ),
            SizedBox(height: 12),
            Text(
              titulo,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 4),
            Text(
              subtitulo,
              style: TextStyle(
                fontSize: 12,
                color: Colors.white.withOpacity(0.9),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _construirSeccionActividadReciente() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Actividad Reciente',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        SizedBox(height: 16),
        Obx(() => Column(
          children: controller.rxActividadReciente.map((actividad) {
            return _construirItemActividadReciente(
              actividad['titulo'],
              actividad['subtitulo'],
              actividad['tiempo'],
              actividad['icono'],
              mxDeHexAColor(actividad['color']),
            );
          }).toList(),
        )),
      ],
    );
  }

  Widget _construirItemActividadReciente(
    String titulo,
    String subtitulo,
    String tiempo,
    IconData icono,
    Color color,
  ) {
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icono,
              color: color,
              size: 24,
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  titulo,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  subtitulo,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  tiempo,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _construirBottomNavigationBar() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _construirItemBottomNav(Icons.home, 'Inicio', true),
              _construirItemBottomNav(Icons.inventory_2_outlined, 'Lotes', false),
              _construirItemBottomNavCentral(Icons.add, 'Nuevo'),
              _construirItemBottomNav(Icons.person_outline, 'Perfil', false),
            ],
          ),
        ),
      ),
    );
  }

  Widget _construirItemBottomNav(IconData icono, String label, bool activo) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icono,
          color: activo ? mxDeHexAColor(COLOR_PRIMARIO) : Colors.grey.shade400,
          size: 24,
        ),
        SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: activo ? mxDeHexAColor(COLOR_PRIMARIO) : Colors.grey.shade400,
            fontWeight: activo ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }

  Widget _construirItemBottomNavCentral(IconData icono, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: mxDeHexAColor(COLOR_PRIMARIO),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: mxDeHexAColor(COLOR_PRIMARIO).withOpacity(0.3),
                blurRadius: 12,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Icon(
            icono,
            color: Colors.white,
            size: 28,
          ),
        ),
        SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: mxDeHexAColor(COLOR_PRIMARIO),
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

// Función helper para convertir hex a Color
Color mxDeHexAColor(String hexColor) {
  hexColor = hexColor.replaceAll("#", "");
  if (hexColor.length == 6) {
    hexColor = "FF" + hexColor;
  }
  return Color(int.parse(hexColor, radix: 16));
}


 */