#include "accountselect.h"
#include "ui_accountselect.h"
#include <QPainter>
#include <QPixmap>


accountselect::accountselect(QWidget *parent)
    : QDialog(parent)
    , ui(new Ui::accountselect)
{
    ui->setupUi(this);
}

accountselect::~accountselect()
{
    delete ui;
}

//valintaruudun tausta, sama kuin kirjautumissivulla
void accountselect::paintEvent(QPaintEvent *event)
{
    QPainter painter(this);
    static const QPixmap selectPix(":/images/backgroundLogin.png");
    painter.drawPixmap(rect(), selectPix);
}
