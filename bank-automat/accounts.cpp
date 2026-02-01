#include "accounts.h"

accounts::accounts() {}

accounts accounts::mapJson(const QJsonObject &json)
{
    accounts accounts;
    accounts.idAccount = json["idAccount"].toInt();
    accounts.idUser = json["idUser"].toString();
    accounts.balance = json["balance"].toDouble();
    accounts.creditLimit = json["creditLimit"].toDouble();
    return accounts;

}
