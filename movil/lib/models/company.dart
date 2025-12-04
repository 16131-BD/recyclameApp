import 'package:flutter/foundation.dart';
import 'package:quiver/core.dart';

import 'index.dart';

@immutable
class Company {

  const Company({
    this.id,
    this.createdAt,
    this.name,
    this.address,
    this.email,
    this.phone,
    this.code,
    this.companyType,
  });

  final int? id;
  final String? createdAt;
  final String? name;
  final String? address;
  final String? email;
  final String? phone;
  final String? code;
  final int? companyType;

  factory Company.fromJson(Map<String,dynamic> json) => Company(
    id: json['id'] != null ? json['id'] as int : null,
    createdAt: json['created_at']?.toString(),
    name: json['name']?.toString(),
    address: json['address']?.toString(),
    email: json['email']?.toString(),
    phone: json['phone']?.toString(),
    code: json['code']?.toString(),
    companyType: json['company_type'] != null ? json['company_type'] as int : null
  );
  
  Map<String, dynamic> toJson() => {
    'id': id,
    'created_at': createdAt,
    'name': name,
    'address': address,
    'email': email,
    'phone': phone,
    'code': code,
    'company_type': companyType
  };

  Company clone() => Company(
    id: id,
    createdAt: createdAt,
    name: name,
    address: address,
    email: email,
    phone: phone,
    code: code,
    companyType: companyType
  );


  Company copyWith({
    Optional<int?>? id,
    Optional<String?>? createdAt,
    Optional<String?>? name,
    Optional<String?>? address,
    Optional<String?>? email,
    Optional<String?>? phone,
    Optional<String?>? code,
    Optional<int?>? companyType
  }) => Company(
    id: checkOptional(id, () => this.id),
    createdAt: checkOptional(createdAt, () => this.createdAt),
    name: checkOptional(name, () => this.name),
    address: checkOptional(address, () => this.address),
    email: checkOptional(email, () => this.email),
    phone: checkOptional(phone, () => this.phone),
    code: checkOptional(code, () => this.code),
    companyType: checkOptional(companyType, () => this.companyType),
  );

  @override
  bool operator ==(Object other) => identical(this, other)
    || other is Company && id == other.id && createdAt == other.createdAt && name == other.name && address == other.address && email == other.email && phone == other.phone && code == other.code && companyType == other.companyType;

  @override
  int get hashCode => id.hashCode ^ createdAt.hashCode ^ name.hashCode ^ address.hashCode ^ email.hashCode ^ phone.hashCode ^ code.hashCode ^ companyType.hashCode;
}
