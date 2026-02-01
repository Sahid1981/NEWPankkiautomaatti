#include "card.h"

card::card() {}

card card::mapJson(const QJsonObject &json)
{
    card card;
    card.idCard = json["idCard"].toString();
    card.cardPIN = json["cardPIN"].toString();
    card.idUser = json["idUser"].toString();
    card.isLocked = json["isLocked"].toBool();
    return card;
}
