import 'package:flutter/foundation.dart';
import 'package:quiver/core.dart';

import 'index.dart';

@immutable
class User {

  const User({
    this.id,
    this.code,
    this.names,
    this.lastNames,
    this.birthDate,
    this.gender,
    this.email,
    this.phone,
    this.createdAt,
    this.companyId,
    this.userType,
    this.token,
  });

  final int? id;
  final String? code;
  final String? names;
  final String? lastNames;
  final String? birthDate;
  final bool? gender;
  final String? email;
  final String? phone;
  final String? createdAt;
  final int? companyId;
  final int? userType;
  final String? token;

  factory User.fromJson(Map<String,dynamic> json) => User(
    id: json['id'] != null ? json['id'] as int : null,
    code: json['code']?.toString(),
    names: json['names']?.toString(),
    lastNames: json['last_names']?.toString(),
    birthDate: json['birth_date']?.toString(),
    gender: json['gender'] != null ? json['gender'] as bool : null,
    email: json['email']?.toString(),
    phone: json['phone']?.toString(),
    createdAt: json['created_at']?.toString(),
    companyId: json['company_id'] != null ? json['company_id'] as int : null,
    userType: json['user_type'] != null ? json['user_type'] as int : null,
    token: json['token']?.toString()
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'code': code,
    'names': names,
    'last_names': lastNames,
    'birth_date': birthDate,
    'gender': gender,
    'email': email,
    'phone': phone,
    'created_at': createdAt,
    'company_id': companyId,
    'user_type': userType,
    'token': token
  };

  User clone() => User(
    id: id,
    code: code,
    names: names,
    lastNames: lastNames,
    birthDate: birthDate,
    gender: gender,
    email: email,
    phone: phone,
    createdAt: createdAt,
    companyId: companyId,
    userType: userType,
    token: token
  );


  User copyWith({
    Optional<int?>? id,
    Optional<String?>? code,
    Optional<String?>? names,
    Optional<String?>? lastNames,
    Optional<String?>? birthDate,
    Optional<bool?>? gender,
    Optional<String?>? email,
    Optional<String?>? phone,
    Optional<String?>? createdAt,
    Optional<int?>? companyId,
    Optional<int?>? userType,
    Optional<String?>? token
  }) => User(
    id: checkOptional(id, () => this.id),
    code: checkOptional(code, () => this.code),
    names: checkOptional(names, () => this.names),
    lastNames: checkOptional(lastNames, () => this.lastNames),
    birthDate: checkOptional(birthDate, () => this.birthDate),
    gender: checkOptional(gender, () => this.gender),
    email: checkOptional(email, () => this.email),
    phone: checkOptional(phone, () => this.phone),
    createdAt: checkOptional(createdAt, () => this.createdAt),
    companyId: checkOptional(companyId, () => this.companyId),
    userType: checkOptional(userType, () => this.userType),
    token: checkOptional(token, () => this.token),
  );

  @override
  bool operator ==(Object other) => identical(this, other)
    || other is User && id == other.id && code == other.code && names == other.names && lastNames == other.lastNames && birthDate == other.birthDate && gender == other.gender && email == other.email && phone == other.phone && createdAt == other.createdAt && companyId == other.companyId && userType == other.userType && token == other.token;

  @override
  int get hashCode => id.hashCode ^ code.hashCode ^ names.hashCode ^ lastNames.hashCode ^ birthDate.hashCode ^ gender.hashCode ^ email.hashCode ^ phone.hashCode ^ createdAt.hashCode ^ companyId.hashCode ^ userType.hashCode ^ token.hashCode;
}
