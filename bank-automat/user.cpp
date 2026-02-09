#include "user.h"

user::user() {}

user user::mapJson(const QJsonObject &json)
{
    user user;
    user.idUser = json["idUser"].toString();
    user.firstName = json["firstName"].toString();
    user.lastName = json["lastName"].toString();
    user.streetAddress = json["streetAddress"].toString();
    user.role = json["role"].toString();
    return user;
}
