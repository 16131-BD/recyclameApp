
import 'dart:convert';

import 'package:get/get.dart';
import 'package:http/http.dart' as http;
import 'package:movil/constants.dart';
import 'package:movil/models/user.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MainAPI extends GetxController with StateMixin<dynamic> {
  MainAPI() {
    change('', status: RxStatus.empty());
  }

  var uri = API_URI;

  Future<Map<String, String>> getHeaders() async {
    Map<String, String> headers = {
      'Content-Type': 'application/json', // Cambiado aquí
      'Accept': 'application/json',
      
    };
    String token = await getToken();
    if (token.isNotEmpty) {
      headers["Authorization"] = "Bearer $token";
    }

    return headers;
  }

  Future<bool> setSession(User user) async {
    SharedPreferences pref = await SharedPreferences.getInstance();
    pref.setString(APP_NAME, jsonEncode(user.toJson()));
    return true;
  }

  Future<String> getToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return await User.fromJson(jsonDecode(prefs.getString(APP_NAME) ?? '{}')).token ?? '';
  }

  Future<dynamic> login(String username, String password) async {
    try {
      final url = Uri.parse('$uri/login');
      var body = jsonEncode({
        "filter": [
          {"code": username, "password": password}
        ]
      });
      
      Map<String, String> headers = await getHeaders();
      var response = await http.post(url, body: body, headers: headers);
      Map<String, dynamic> result = jsonDecode(response.body) as Map<String, dynamic>;
      print(result);
      return result;
    } catch (err) {
      print(err);
      return err.toString();
    }
  }

  Future<dynamic> getEntityBy(String entity, dynamic body) async {
    try {
      final url = Uri.parse('$uri/$entity/by');
      
      Map<String, String> headers = await getHeaders();
      var response = await http.post(url, body: jsonEncode(body), headers: headers);
      Map<String, dynamic> result = jsonDecode(response.body) as Map<String, dynamic>;
      print(result);
      return result;
    } catch (err) {
      print(err);
      return err.toString();
    }
  }

  Future<dynamic> setEntityBy(String entity, dynamic body) async {
    try {
      final url = Uri.parse('$uri/$entity/create');
      
      Map<String, String> headers = await getHeaders();
      var response = await http.post(url, body: jsonEncode(body), headers: headers);
      Map<String, dynamic> result = jsonDecode(response.body) as Map<String, dynamic>;
      print(result);
      return result;
    } catch (err) {
      print(err);
      return err.toString();
    }
  }
}