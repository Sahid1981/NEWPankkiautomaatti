#include "card.h"

card::card() {}

card card::mapJson(const QJsonObject &json)
{
    card card;
    card.idcard = json["idcard"].toString();
    card.cardPIN = json["cardPIN"].toString();
    card.iduser = json["iduser"].toString();
    card.is_locked = json["is_locked"].toBool();
    return card;
}
