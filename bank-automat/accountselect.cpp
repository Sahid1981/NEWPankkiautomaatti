#include "accountselect.h"
#include "ui_accountselect.h"
#include "account.h"

#include <QPainter>
#include <QPixmap>

accountselect::accountselect(
    const LoginResultDto& loginResult,
    ApiClient* api,
    QWidget *parent
)
: QDialog(parent)
, ui(new Ui::accountselect)
, m_api(api)
, m_login(loginResult)
{
    ui->setupUi(this);
    
    ui->labelTest->setText("Käyttäjä: " + m_login.idUser);
}

accountselect::~accountselect()
{
    delete ui;
}

void accountselect::on_btnSelectDebit_clicked()
{
    selectedAccountType = "debit";
    openAccountWindow();
}

void accountselect::on_btnSelectCredit_clicked()
{
    selectedAccountType = "credit";
    openAccountWindow();
}

void accountselect::openAccountWindow()
{
    account* accountWindow = new account(m_login.idCard, selectedAccountType, nullptr);
    accountWindow->setAttribute(Qt::WA_DeleteOnClose);
    accountWindow->showMaximized();
    
    this->close();
}

void accountselect::paintEvent(QPaintEvent *)
{
    QPainter painter(this);
    QPixmap bg(":/images/background.png");
    painter.drawPixmap(rect(), bg);
}
